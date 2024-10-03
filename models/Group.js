import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Post from './Post.js';

// 그룹 스키마 및 모델 정의
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String, required: false },
    isPublic: { type: Boolean, required: true, default: true },
    introduction: { type: String, required: false },
    grouplikeCount: { type: Number, default: 0 },
    badges: [{ type: String }],
    postCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true } }); // D-Day 필드 (가상 필드로 계산)

groupSchema.virtual('dDay').get(function() {
    const today = new Date();
    const createdDate = new Date(this.createdAt);
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays; // 경과한 일수 반환
});

// 비밀번호 저장 전 해시 처리
groupSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

//그룹이 삭제되기 전에 해당 그룹 내의 모든 게시글들 삭제
groupSchema.pre('findOneAndDelete', async function(next) {
    try {
        const groupId = this.getQuery()._id; // 삭제하려는 그룹의 ID를 가져옴

        // 게시글 삭제 (해당 그룹내에 있는 모든 게시글 삭제)
        await Post.deleteMany({ groupId });

        next(); // 다음 미들웨어로 넘어가기
    } catch(error) {
        next(error); // 에러 발생 시 처리
    }    
});

const Group = mongoose.model('Group', groupSchema);

export default Group;