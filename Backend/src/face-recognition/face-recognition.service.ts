// src/face-recognition/face-recognition.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  DeleteFacesCommand,
} from '@aws-sdk/client-rekognition';

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly logger = new Logger(FaceRecognitionService.name);
  private rekognitionClient: RekognitionClient;
  private collectionId: string;

  constructor() {
    this.collectionId = process.env.AWS_REKOGNITION_COLLECTION_ID|| 'coffetek-faces';
    
    this.rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  // Auto-create collection on module init
  async onModuleInit() {
    await this.createCollection();
  }

  async createCollection(): Promise<void> {
    try {
      const command = new CreateCollectionCommand({
        CollectionId: this.collectionId,
      });
      await this.rekognitionClient.send(command);
      this.logger.log(`✅ Collection "${this.collectionId}" created successfully`);
    } catch (error: any) {
      if (error.name === 'ResourceAlreadyExistsException') {
        this.logger.log(`ℹ️  Collection "${this.collectionId}" already exists`);
      } else {
        this.logger.error(`❌ Error creating collection: ${error.message}`);
      }
    }
  }

  /**
   * Register a face in the collection
   */
  async registerFace(imageBuffer: Buffer, externalImageId: string): Promise<string> {
    try {
      const command = new IndexFacesCommand({
        CollectionId: this.collectionId,
        Image: { Bytes: imageBuffer },
        ExternalImageId: externalImageId,
        MaxFaces: 1,
        QualityFilter: 'AUTO',
        DetectionAttributes: ['ALL'],
      });

      const response = await this.rekognitionClient.send(command);

      if (!response.FaceRecords || response.FaceRecords.length === 0) {
        throw new Error('NO_FACE_DETECTED');
      }

      if (response.FaceRecords.length > 1) {
        throw new Error('MULTIPLE_FACES');
      }

      const faceId = response.FaceRecords[0].Face?.FaceId;
      if (!faceId) {
        throw new Error('FACE_ID_NOT_FOUND');
      }

      return faceId;
    } catch (error: any) {
      if (error.name === 'InvalidImageFormatException') {
        throw new Error('INVALID_IMAGE');
      }
      if (error.name === 'ImageTooLargeException') {
        throw new Error('IMAGE_TOO_LARGE');
      }
      throw error;
    }
  }

  /**
   * Search for a face in the collection
   */
  async searchFace(imageBuffer: Buffer): Promise<{ faceId: string; similarity: number; externalImageId: string } | null> {
    try {
      const command = new SearchFacesByImageCommand({
        CollectionId: this.collectionId,
        Image: { Bytes: imageBuffer },
        MaxFaces: 1,
        FaceMatchThreshold: 70,
      });

      const response = await this.rekognitionClient.send(command);

      if (!response.FaceMatches || response.FaceMatches.length === 0) {
        return null;
      }

      const match = response.FaceMatches[0];
      return {
        faceId: match.Face?.FaceId || '',
        similarity: match.Similarity || 0,
        externalImageId: match.Face?.ExternalImageId || '',
      };
    } catch (error: any) {
      if (error.name === 'InvalidImageFormatException') {
        throw new Error('INVALID_IMAGE');
      }
      throw error;
    }
  }

  /**
   * Delete a face from collection
   */
  async deleteFace(faceId: string): Promise<void> {
    try {
      const command = new DeleteFacesCommand({
        CollectionId: this.collectionId,
        FaceIds: [faceId],
      });
      await this.rekognitionClient.send(command);
    } catch (error: any) {
      this.logger.error(`Error deleting face: ${error.message}`);
      throw error;
    }
  }
}