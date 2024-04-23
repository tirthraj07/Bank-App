"use client"
import SignupComponent from "@/components/signup";
import { useEffect, useState } from "react"

export default function LoginPage(){
    const [page,setPage] = useState('signup');
    
    function signUpPage(){
        setPage('signup');
    }
    function loginPage(){
        setPage('login');
    }

    return (

        <>
            {
                page=='signup'?
                <>
                    <SignupComponent loginPage={loginPage} />
                </>
                :
                <>
                    Login Page
                    <button onClick={signUpPage} >Signup?</button>
                </>            
            }
        
        </>

    )

}