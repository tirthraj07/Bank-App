const BACKEND_URL = 'http://127.0.0.1:3005'

export async function POST(request:Request){
    const data = await request.json()
    if(!data.email||!data.password||!data.username||!data.name){

        return new Response(JSON.stringify({"error":"insufficient data"}),{
            headers:{
                "Content-Type":"application/json",
            },
            status:400
        })
    }

    const jsonPayload = {
        name:data.name,
        username:data.username,
        email:data.email,
        password: data.password
    }


    const res = await fetch(`${BACKEND_URL}/auth/signup`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(jsonPayload)
    })

    return res

}