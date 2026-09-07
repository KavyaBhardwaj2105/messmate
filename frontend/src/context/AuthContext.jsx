import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AUTH_EVENTS, setAccessToken } from '../services/api';
import { useToast } from './ToastContext';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user,setUser]=useState(null); const [token,setTokenState]=useState(null); const [loading,setLoading]=useState(true); const [authError,setAuthError]=useState(null);
  const {showSuccess,showError,showWarning}=useToast();
  const applySession=(newToken,userData)=>{ setAccessToken(newToken); setTokenState(newToken); setUser(userData); };
  useEffect(()=>{ let mounted=true; (async()=>{ try { const newToken=await authService.refresh(); if(!mounted)return; const me=await authService.getMe(); applySession(newToken,me.data.user); } catch { setAccessToken(null); if(mounted)setUser(null); } finally { if(mounted)setLoading(false); } })(); return()=>{mounted=false}; },[]);
  useEffect(()=>{ const h=()=>{setAccessToken(null);setTokenState(null);setUser(null);showWarning('Your session expired. Please sign in again.');}; window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED,h); return()=>window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED,h); },[showWarning]);
  const login=async(email,password)=>{try{const r=await authService.login({email,password});applySession(r.data.token,r.data.user);showSuccess(r.data.message||'Welcome back to MessMate!');return{success:true}}catch(e){showError(e.message);return{success:false,error:e.message}}};
  const signup=async(name,email,password)=>{try{const r=await authService.signup({name,email,password});showSuccess(r.data.message);return{success:true,requiresEmailVerification:true,verificationLink:r.data.verificationLink}}catch(e){showError(e.message);return{success:false,error:e.message}}};
  const logout=async()=>{try{await authService.logout()}catch{} setAccessToken(null);setTokenState(null);setUser(null);showSuccess('Logged out successfully.');};
  return <AuthContext.Provider value={{user,token,loading,authError,isAuthenticated:!!user,login,signup,logout}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within AuthProvider');return c};
