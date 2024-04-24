import { cookies } from "next/headers";

const BACKEND_URL = 'http://127.0.0.1:3005';

export async function GET(){
    const cookieStore = cookies()
    const status = cookieStore.has('userToken')
    if(!status){
        return new Response(JSON.stringify({success: true}),{
            headers:{
               'Content-Type':'application/json'
            },
            status: 200
        })
    }

    const userToken = cookieStore.get('userToken')['value'];
    const jsonPayload = {
        userToken:userToken
    }

    const res = await fetch(`${BACKEND_URL}/auth/logout`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(jsonPayload)

    })
    const data = await res.json()
    if(!data['success']){
        return new Response(JSON.stringify({success: false}),{
            headers:{
               'Content-Type':'application/json'
            },
            status: 200
        })    
    }

    cookieStore.delete('userToken');

    return new Response(JSON.stringify({success: true}),{
        headers:{
           'Content-Type':'application/json'
        },
        status: 200
    })

}