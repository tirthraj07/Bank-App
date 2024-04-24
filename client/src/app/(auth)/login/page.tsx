"use client"
import SignupComponent from "@/components/signup";
import LoginComponent from "@/components/login"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";

export default function LoginPage(){
    const router = useRouter()
    const [page,setPage] = useState('signup');
    
    function signUpPage(){
        setPage('signup');
    }
    function loginPage(){
        setPage('login');
    }

    useEffect(()=>{
        async function checkLoginStatus(){
            const res = await fetch('/api/isLoggedIn',{method:'GET'})
            const data = await res.json()
            if(data['status']){
                router.push('/logout')
            }
        }

        checkLoginStatus();
    },[])

    return (

        <>
            {
                page=='signup'?
                <>
                    <SignupComponent loginPage={loginPage} />
                </>
                :
                <>
                    <LoginComponent signUpPage={signUpPage}/>
                </>            
            }
        
        </>

    )

}