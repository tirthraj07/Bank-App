"use client"

import { useEffect, useState } from "react";

export default function FetchFunction(){
    const [displayData, setDisplayData] = useState('');
    
    const callAPI = async ()=>{
        try{
            const response = await fetch('http://127.0.0.1:3005/api')
            const data = await response.json()
            setDisplayData(data['Message']);
        }
        catch(err){
            console.log(err);
        }
    }
    
    useEffect(()=>{
        callAPI();
    },[])
    return(
        <>
            {displayData}
        </>
    );
}