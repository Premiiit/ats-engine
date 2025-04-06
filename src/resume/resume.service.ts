import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Express } from 'express';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async uploadResume(file: Express.Multer.File, userId: string, jobRole?: string) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const existingResume = await this.prisma.resume.findUnique({
      where: { userId },
    });

    let resume;
    if (existingResume) {
      resume = await this.prisma.resume.update({
        where: { userId },
        data: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
          jobRole: jobRole || existingResume.jobRole,
        },
      });
    } else {
      resume = await this.prisma.resume.create({
        data: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
          jobRole: jobRole || null,
          user: { connect: { id: userId } },
        },
      });
    }

    // Admin jo fields dalega wo Jobs hai
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(file.path), file.filename);
    formData.append('jobRole', jobRole || '');

    try {
        const modelResponse = await axios.post('https://ats-system-flask.onrender.com/', formData, {
          headers: {
            ...formData.getHeaders(), // Set correct Content-Type headers
          },
        });
    
        if (!modelResponse.data.success) {
          throw new Error(modelResponse.data.message || 'Failed to process resume');
        }
        //make changes here
        const atsScore = modelResponse.data.data.ats_score; // Extract ATS score
        const updatedJobRole = jobRole || modelResponse.data.data.job_description; // Keep user's jobRole if provided
    
        let resume;
        if (existingResume) {
          resume = await this.prisma.resume.update({
            where: { userId },
            data: {
              filename: file.filename,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
              uploadedAt: new Date(),
              atsScore, // Store ATS Score
              jobRole: existingResume.jobRole ? existingResume.jobRole : updatedJobRole, // Update jobRole only if it's empty
            },
          });
        } else {
          resume = await this.prisma.resume.create({
            data: {
              filename: file.filename,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
              uploadedAt: new Date(),
              atsScore, // Store ATS Score
              jobRole: updatedJobRole, // Assign jobRole from model if not provided
              user: { connect: { id: userId } },
            },
          });
        }
    
        return { success: true, data: resume };
      } catch (error) {
        console.error('Error sending resume to model:', error.response?.data || error.message);
        throw new HttpException(
          { success: false, message: error.response?.data?.message || 'Error processing resume' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    async linkResumeToJob(userId: string, jobId: string, atsScore: number, jobRole: string) {
      // Fetch user's resume
      const resume = await this.prisma.resume.findUnique({
        where: { userId },
      });
  
      if (!resume) {
        throw new NotFoundException('Resume not found for the current user.');
      }
  
      // Update the resume with ATS score and job role
      await this.prisma.resume.update({
        where: { id: resume.id },
        data: {
          atsScore,
          jobRole,
        },
      });
  
      // Create an entry in JobResume
      await this.prisma.jobResume.create({
        data: {
          jobId,
          resumeId: resume.id,
          atsScore,
        },
      });
  
      return { message: 'Resume linked to job successfully', atsScore };
    }
  

  async getResume(userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async deleteResume(userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return await this.prisma.resume.delete({
      where: { userId },
    });
  }
}
