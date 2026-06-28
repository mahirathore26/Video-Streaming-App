 const asynchandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
 }
export { asynchandler};

// const asynchandler=()=>{}
// const asynchandler=(fn)=>{}
// const asynchandler=(fn)=>{()=>{}}

// const asynchandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(err){
//          res.status(err.code||500).json({
//             sucess:false,
//             message:err.message||"Internal Server Error"
//          })
//     }
// }
