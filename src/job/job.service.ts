// src/job/job.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './create-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async createJob(createJobDto: CreateJobDto, recruiterId: string) {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        recruiterId,
      },
    });
  }

  async getJobsByRecruiter(recruiterId: string) {
    return this.prisma.job.findMany({
      where: { recruiterId },
    });
  }
  async getAllJobs() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteJob(jobId: string, recruiterId: string) {
    // Check if job exists and belongs to the recruiter
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
  
    if (!job || job.recruiterId !== recruiterId) {
      return null;
    }
  
    await this.prisma.job.delete({ where: { id: jobId } });
    return true;
  }
}

