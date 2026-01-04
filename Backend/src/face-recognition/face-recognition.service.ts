// src/face-recognition/face-recognition.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(private configService: ConfigService) {
    this.collectionId = this.configService.get<string>('AWS_REKOGNITION_COLLECTION_ID') || 'coffetek-faces';
    
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';

    // Validate credentials
    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('⚠️  AWS credentials not found. Face recognition features will not work.');
      this.logger.warn('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
      // Create a dummy client to prevent errors, but it won't work
      this.rekognitionClient = new RekognitionClient({
        region,
        credentials: {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy',
        },
      });
      return;
    }
    
    this.rekognitionClient = new RekognitionClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // Auto-create collection on module init
  async onModuleInit() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('⚠️  Skipping collection creation - AWS credentials not configured');
      return;
    }
    
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
      } else if (error.message?.includes('credential') || error.message?.includes('Invalid')) {
        this.logger.error(`❌ AWS Credentials Error: ${error.message}`);
        this.logger.error('Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
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