import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule} from '@nestjs/config';
import { JwtStrategy } from './strategy';
import { MailModule } from 'src/common/mail/mail.module';
import { RedisModule } from 'src/redis/redis.module';
import { FaceRecognitionModule } from 'src/face-recognition/face-recognition.module';
@Module({
  imports: [JwtModule.register({}), ConfigModule, MailModule, RedisModule, FaceRecognitionModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

})
export class AuthModule { }
