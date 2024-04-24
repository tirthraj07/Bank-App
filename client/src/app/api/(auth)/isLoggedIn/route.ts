import { cookies } from "next/headers";

const BACKEND_URL = 'http://127.0.0.1:3005';

export async function GET(){
    const cookieStore = cookies()
    const status = cookieStore.has('userToken')
    //console.log(status)
    if(!status){
        return new Response(JSON.stringify({status: status}),{
            headers:{
               'Content-Type':'application/json'
            },
            status: 200
        })
    }

    const userToken = cookieStore.get('userToken');

    const res = await fetch(`${BACKEND_URL}/auth/verifyUserToken?userToken=${userToken['value']}`)
    const data = await res.json()
    if(status&&!data['valid']){
        cookieStore.delete('userToken');
    }
    return new Response(JSON.stringify({status: data['valid']}),{
        headers:{
           'Content-Type':'application/json'
        },
        status: 200
    })

}