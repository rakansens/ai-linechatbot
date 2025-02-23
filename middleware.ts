import NextAuth from 'next-auth';
import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

// 開発環境では認証をスキップ
const matcher = process.env.NODE_ENV === 'development' 
  ? [] // 開発環境では全てのパスでAUTHをスキップ
  : ['/', '/:id', '/api/:path*', '/login', '/register'];

export const config = { matcher };
