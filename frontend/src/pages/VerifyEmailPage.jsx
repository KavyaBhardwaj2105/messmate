import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { authService } from '../services/api';

export default function VerifyEmailPage(){
 const [params]=useSearchParams(); const [state,setState]=useState('loading'); const [message,setMessage]=useState('Verifying your email…');
 useEffect(()=>{ const token=params.get('token'); if(!token){setState('error');setMessage('Verification token is missing.');return;} authService.verifyEmail(token).then(r=>{setState('success');setMessage(r.data.message)}).catch(e=>{setState('error');setMessage(e.message)}); },[params]);
 return <PageContainer maxWidth="max-w-md"><div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lifted text-center">{state==='loading'?<Loader2 className="w-10 h-10 mx-auto animate-spin text-brand-600"/>:state==='success'?<CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500"/>:<XCircle className="w-12 h-12 mx-auto text-rose-500"/>}<h1 className="text-2xl font-black text-slate-900 mt-4">{state==='success'?'Email verified':'Email verification'}</h1><p className="text-sm text-slate-500 mt-2">{message}</p>{state!=='loading'&&<Link to="/login" className="inline-flex mt-6 px-5 py-3 rounded-2xl bg-brand-600 text-white font-bold">Go to sign in</Link>}</div></PageContainer>
}
