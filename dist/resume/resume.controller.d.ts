import { ResumeService } from './resume.service';
export declare class ResumeController {
    private readonly resumeService;
    constructor(resumeService: ResumeService);
    uploadResume(file: Express.Multer.File, req: any, jobRole: string, atsScoreRaw: string): Promise<any>;
    getResume(req: any): Promise<{
        id: number;
        filename: string;
        path: string;
        mimetype: string;
        size: number;
        uploadedAt: Date;
        jobRole: string | null;
        atsScore: number | null;
        userId: string;
    }>;
}
