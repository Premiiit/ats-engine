"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const common_1 = require("@nestjs/common");
const job_service_1 = require("./job.service");
const create_job_dto_1 = require("./create-job.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let JobController = class JobController {
    jobService;
    constructor(jobService) {
        this.jobService = jobService;
    }
    async createJob(createJobDto, req) {
        const user = req.user;
        if (user.role !== 'RECRUITER') {
            throw new common_1.ForbiddenException('Only recruiters can post jobs');
        }
        return this.jobService.createJob(createJobDto, user.id);
    }
    async getMyJobs(req) {
        const user = req.user;
        return this.jobService.getJobsByRecruiter(user.id);
    }
    async getAllJobs() {
        return this.jobService.getAllJobs();
    }
    async getResumesForJob(jobId, req) {
        const user = req.user;
        return this.jobService.getResumesForJob(jobId, user.id);
    }
    async deleteJob(id, req) {
        const user = req.user;
        if (user.role !== 'RECRUITER') {
            throw new common_1.ForbiddenException('Only recruiters can delete jobs');
        }
        const deleted = await this.jobService.deleteJob(id, user.id);
        if (!deleted) {
            throw new common_1.NotFoundException('Job not found or unauthorized');
        }
        return { message: 'Job deleted successfully' };
    }
};
exports.JobController = JobController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_job_dto_1.CreateJobDto, Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "createJob", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-jobs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getMyJobs", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getAllJobs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':jobId/resumes'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getResumesForJob", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "deleteJob", null);
exports.JobController = JobController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [job_service_1.JobService])
], JobController);
//# sourceMappingURL=job.controller.js.map