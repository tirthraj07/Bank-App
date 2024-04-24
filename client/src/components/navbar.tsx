"use client"
import { useEffect } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from "next/navigation"


export default function NavBar(){
    useEffect(()=>{
        require('bootstrap/dist/css/bootstrap.min.css')
        require('bootstrap/dist/js/bootstrap.bundle.min.js')
    },[])

    const pathname = usePathname()
    const isLoggedIn = !pathname.startsWith('/login')

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-light p-2" style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                <div>
                    <Link className="navbar-brand" href="/" style={{fontSize:'2rem'}} id="navbar-brand">
                        <Image
                            src="https://png.pngtree.com/template/20190308/ourmid/pngtree-banking-logo-image_63077.jpg"
                            width={70}
                            height={70}
                            alt=""
                            style={{mixBlendMode:"multiply"}}
                        />
                        Bank App
                    </Link>
                </div>
                <div className="navbar-toggler d-md-none border-0" style={{display: "flex", justifyContent: "end"}}>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                {
                    isLoggedIn?
                    <>
                        <div className="collapse navbar-collapse" id="navbarNav" style={{justifyContent: "end", fontSize: "1.3rem"}}>
                            <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link active" style={{display: "inline-block"}} aria-current="page" href="/">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" style={{display: "inline-block"}} href="/chat">
                                    Chat
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" style={{display: "inline-block"}} href="/logout">
                                    Logout
                                </Link>
                            </li>
                            </ul>
                        </div>
                    </>
                    :
                    <></>
                }
                </nav>
        
        </>
    )
}