"use client"
import { useEffect, useState } from 'react';
import { useCookies } from 'next-client-cookies';
import { useRouter } from 'next/navigation'

const BACKEND_URL = 'http://127.0.0.1:3005'


export default function SignupComponent({loginPage}:{
    loginPage: () => void;
}){ 
    const cookies = useCookies();
    const router = useRouter()
    useEffect(()=>{
        require('bootstrap/dist/css/bootstrap.min.css')
        require('bootstrap/dist/js/bootstrap.bundle.min.js')
    },[])

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: ''
    });

    const handleError = (err: Error) => {
        alert(err.message);
        console.log(err.message);
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function signUpRequest(formData: { name: string; email: string; username: string; password: string; }) {
        try{
        
            const response = await fetch(`${BACKEND_URL}/auth/signup`,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            

            const data = await response.json()

            if(data['error']) throw new Error(data['error'])
            
            cookies.set('userToken',data['userToken'])
            
            console.log(data);
            
            router.push('/');
        }
        catch(err){
            handleError(err as Error);
        }   
    }
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: string[] = validateForm(formData);
        if (errors.length === 0) {
            console.log(formData);
            await signUpRequest(formData);
            
        } else {
            setValidationErrors(errors);
        }


        // setFormData({name:'',email:'',username:'',password:''})
    };

    const validateForm = (data: { name: string; email: string; username: string; password: string; }) => {
        const errors: string[] = [];

        // Password validation
        if (data.password.length < 8 || !(/[a-zA-Z]/.test(data.password)) || !(/\d/.test(data.password)) || !(/[^\w\s]/.test(data.password))) {
            errors.push('Password must be longer than 8 characters and contain alphabets, numbers, and symbols.');
        }

        // Username validation
        if (!(/^[\w]+$/.test(data.username))) {
            errors.push('Username must not contain any characters except underscore (_).');
        }

        // Email validation
        const emailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com'];
        const emailProvider = data.email.split('@')[1];
        if (!emailProviders.includes(emailProvider)) {
            errors.push('Email must be from a valid provider (Google, Yahoo, Hotmail).');
        }

        // Name validation
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.name) || /\d/.test(data.name)) {
            errors.push('Name must not contain any special symbols or numbers.');
        }

        return errors;
    };

    return (
        <>
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Sign Up</button>
                    </form>
                    {validationErrors.length > 0 && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {validationErrors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </div>
                    )}
                    <p className="mt-3">Already have an account? <button onClick={loginPage} className="btn btn-link">Login</button></p>
                </div>
            </div>
        </div>
        </>
    )
}

