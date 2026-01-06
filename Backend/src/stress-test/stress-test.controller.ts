import { Controller, Post, Query } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Controller('stress-test')
export class StressTestController {
    @Post('bcrypt')
  async testBcrypt(@Query('rounds') rounds: number = 12) {
    const start = Date.now();
    const dummyData = "coffeeTek-security-heavy-payload-12345";
    
    // Thực hiện băm dữ liệu với số vòng lặp cao
    // Cấp độ 12-15 sẽ khiến CPU xử lý rất nặng
    const hash = await bcrypt.hash(dummyData, Number(rounds));
    
    const duration = Date.now() - start;
    return {
      message: "Hash completed",
      duration: `${duration}ms`,
      node: process.env.RAILWAY_REPLICA_ID || 'unknown' // Giúp nhận diện request rơi vào instance nào
    };
  }
}
