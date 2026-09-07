const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(x=>x.trim()).filter(Boolean);
const sameOrigin = (req,res,next)=>{ const origin=req.get('origin'); if(!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) return next(); return res.status(403).json({success:false,message:'Request origin is not allowed.'}); };
module.exports={sameOrigin};
