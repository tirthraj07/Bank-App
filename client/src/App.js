import { useEffect, useState } from "react";

export const BACKEND_URL = 'http://127.0.0.1:3005'

export default function App() {
  const [ response, setResponse ] = useState('');
  
  useEffect(()=>{
    fetch(`${BACKEND_URL}/api`)
    .then(response =>{
      if(!response.ok) throw new Error('Response Not Okay');
      return response.json() 
    })
    .then(data=>{
      console.log(data);
      setResponse(data);
    })
    .catch(err=>{
      console.error(err);
    })
  },[])

  return (
    <>
      Message : {response['Message']}
    </>
  );
}


