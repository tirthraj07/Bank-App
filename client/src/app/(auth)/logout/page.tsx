"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"


export default function LogoutPage() {
    const router = useRouter()
    
    useEffect(()=>{
        require('bootstrap/dist/css/bootstrap.min.css')
        require('bootstrap/dist/js/bootstrap.bundle.min.js')
    
        async function isLoggedIn(){
            const res = await fetch('/api/isLoggedIn',{method:'GET'})
            const data = await res.json()
            if(!data['status']){
                router.push('/login')
            }
        }

        isLoggedIn();

    },[])


    const [logoutConfirmed, setLogoutConfirmed] = useState(false);

    const handleLogout = async () => {
        
        const res = await fetch('/api/logout',{method:'GET'})
        const data = await res.json()
        if(data['success']){
            alert('Logged out Successfully!')
            router.push('/login');
        }
        else alert('There was a problem while logging out')

    };

    useEffect(() => {
        if (logoutConfirmed) {
            handleLogout();
        }
    }, [logoutConfirmed]);

    const confirmLogout = () => {
        const confirmation = window.confirm("Are you sure you want to logout?");
        if (confirmation) {
            setLogoutConfirmed(true);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6 mt-5">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Logout</h2>
                            <p className="card-text text-center mb-4">You are attempting to logout. Are you sure?</p>
                            <div className="d-grid gap-2">
                                <button className="btn btn-danger" onClick={confirmLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}