import { Module } from '@nestjs/common';
import { B2Service } from './b2.service';

@Module({ providers: [B2Service], exports: [B2Service] })
export class StorageFileModule { }
