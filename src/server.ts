import {Server} from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";




let server: Server;

const startServer = async ()=>{
    try {
        await mongoose.connect(envVars.DB_URL)

        console.log("Server is Connected to DB!!");
        server = app.listen(envVars.PORT, ()=>{
            console.log(`Server is listening to port ${envVars.PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}


process.on("unhandledRejection", ()=>{
    console.log("Unhandled Rejection detected... Server Shutting Down");

    if(server){
        server.close(()=>{
            process.exit(1);
        })
    }
    process.exit(1);
})


process.on("uncaughtException", ()=>{
    console.log("Uncaught Expectation detected... Server Shutting Down");

    if(server){
        server.close(()=>{
            process.exit(1);
        })
    }
    process.exit(1);
})



process.on("SIGTERM", ()=>{
    console.log("Caught Signal For Shutdown... Server Shutting Down");

    if(server){
        server.close(()=>{
            process.exit(1);
        })
    }
    process.exit(1);
})


startServer();