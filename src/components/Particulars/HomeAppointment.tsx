import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../contexts/UserContext';
import { glassMorphism, glassMorphismLower, title, h2, borderGlass, button } from '../../variableTailwind';
import { BsArrowUpCircle } from 'react-icons/bs';

const HomeAppointment = () => {

    const { userLogin }: any = useContext(UserContext);
    const [infosAppointments, setInfosAppointments] = useState<any>([]);
    const [pros, setPros] = useState<any>([]);
    const [showPastAppointments, setShowPastAppointments] = useState<boolean>(false);
    const [showAll, setShowAll] = useState<boolean>(false);
    const [showAllPast, setShowAllPast] = useState<boolean>(false);
    console.log(infosAppointments);
    console.log(pros);

    // Date of the day
    let today = new Date().toISOString();

    useEffect(() => {
        async function getAppointments() {
            try {
                const res = await axios.get(`http://localhost:8000/api/appointment/user/${userLogin.id_user}`, {
                    withCredentials: true,
                  });
                if (res.status === 200) {
                    const resPros = await axios.get(`http://localhost:8000/api/pros/`, {
                        withCredentials: true,
                    });
                setInfosAppointments(res.data);
                setPros(resPros.data); 
            }}

            catch (err) {
                console.log(err);
            }
        };
        getAppointments();
    }, [userLogin]);

    const dateDisplay = (element:Array<any>) => {
        const wholeDate =element.slice(0,10);
        const day = wholeDate.slice(8,10);
        const month = wholeDate.slice(5,7);
        const year = wholeDate.slice(0,4);
        const orderedDate = `${day}/${month}/${year}`;
        return orderedDate;
    }
    const hourDisplay = (element:Array<any>) => {
        const hourDate = element.slice(11,16);
        return hourDate;
    }

    return (
        <div className='flex flex-col items-center justify-center w-full h-full pb-5'>
            <div className="flex items-center justify-center">
                <h1 className={`${title}`}>Mes rendez-vous</h1>
            </div>
            <div className={`${glassMorphism} w-11/12 max-w-xl rounded-lg pb-4`}>
                <div className='flex flex-col items-center justify-around'>
                    <h2 className={`${h2}`}>Mes prochains rendez-vous</h2>
                    {(infosAppointments.length !== 0 && pros.length !== 0) &&
                    infosAppointments
                    .filter((e:any) => e.date > today)
                    .sort((function(a:any, b:any) {
                        a = new Date(a.date);
                        b = new Date(b.date);
                        return a > b ? 1 : -1;
                    }))
                    .slice(0, 2)
                    .map((app:any, index:number) =>
                        <div
                        key={index}
                        className={`${borderGlass} w-11/12 mb-2`}
                        >
                            <p className='text-sm'>{"le "}
                                <span className="font-medium underline">{dateDisplay(app.date)}</span>
                                {" à "}
                                <span className="font-medium underline">{hourDisplay(app.date)}</span>
                            </p>
                            <p className='text-black leading-[1] my-2'>{app.comment}</p>
                            <p className='text-sm'>{"Avec "}
                                <span className="font-medium underline">{pros.find((el:any) => el.id_pros === app.prosId).name}</span>
                            </p>
                        </div>)
                    }
                     {(infosAppointments.length !== 0 && pros.length !== 0) &&
                     infosAppointments
                     .filter((e:any) => e.date > today)
                     .sort((function(a:any, b:any) {
                        a = new Date(a.date);
                        b = new Date(b.date);
                        return a > b ? 1 : -1;
                    }))
                     .slice(2, (infosAppointments.length - 1))
                     .map((app:any, index:number) =>
                        <div
                        key={index}
                        className={`${borderGlass} w-11/12 mb-2 ${showAll ? "" : "hidden"}`}
                        >
                            <p className='text-sm'>{"le "}
                                <span className="font-medium underline">{dateDisplay(app.date)}</span>
                                {" à "}
                                <span className="font-medium underline">{hourDisplay(app.date)}</span>
                            </p>
                            <p className='text-black leading-[1] my-2'>{app.comment}</p>
                            <p className='text-sm'>{"Avec "}
                                <span className="font-medium underline">{pros.find((el:any) => el.id_pros === app.prosId).name}</span>
                            </p>
                        </div>)
                    }
                </div>
                <p className="cursor-pointer hover:underline"
                onClick={() => setShowAll(!showAll)} >{showAll ? "Retour" : "Voir tout"}</p>
            </div>

            <div className={`${showPastAppointments ? `${glassMorphism} mt-6 pt-3` : ""} w-11/12 max-w-xl rounded-lg pb-4`}>
                <div className="flex flex-col items-center justify-around">
                    <button 
                    className={`${button} text-md font-inter max-w-md mb-2 w-4/6 flex justify-center`}
                    onClick={() => {setShowPastAppointments(!showPastAppointments); setShowAllPast(false)} } >
                        {showPastAppointments ? <BsArrowUpCircle className='text-lg font-bold' /> : "Voir mes rendez-vous passés"}
                    </button>
                    {(infosAppointments.length !== 0 && pros.length !== 0) &&
                    infosAppointments
                    .filter((e:any) => e.date < today)
                    .sort((function(a:any, b:any) {
                        a = new Date(a.date);
                        b = new Date(b.date);
                        return a < b ? 1 : -1;
                    }))
                    .slice(0, 2)
                    .map((app:any, index:number) =>
                        <div
                        key={index}
                        className={`${borderGlass} w-11/12 mb-2 ${showPastAppointments ? "" : "hidden"}`}
                        >
                            <p className='text-sm'>{"le "}
                                <span className="font-medium underline">{dateDisplay(app.date)}</span>
                                {" à "}
                                <span className="font-medium underline">{hourDisplay(app.date)}</span>
                            </p>
                            <p className='text-black leading-[1] my-2'>{app.comment}</p>
                            <p className='text-sm'>{"Avec "}
                                <span className="font-medium underline">{pros.find((el:any) => el.id_pros === app.prosId).name}</span>
                            </p>
                        </div>)
                    }
                     {(infosAppointments.length !== 0 && pros.length !== 0) && 
                            infosAppointments
                            .filter((e:any) => e.date < today)
                            .sort((function(a:any, b:any) {
                                a = new Date(a.date);
                                b = new Date(b.date);
                                return a < b ? 1 : -1;
                            }))
                            .slice(2, (infosAppointments.length - 1))
                            .map((app:any, index:number) =>
                        <div
                        key={index}
                        className={`${borderGlass} w-11/12 mb-2 ${showAllPast ? "" : "hidden"}`}
                        >
                            <p className='text-sm'>{"le "}
                                <span className="font-medium underline">{dateDisplay(app.date)}</span>
                                {" à "}
                                <span className="font-medium underline">{hourDisplay(app.date)}</span>
                            </p>
                            <p className='text-black leading-[1] my-2'>{app.comment}</p>
                            <p className='text-sm'>{"Avec "}
                                <span className="font-medium underline">{pros.find((el:any) => el.id_pros === app.prosId).name}</span>
                            </p>
                        </div>)
                    }
                    </div>
                    <p 
                    className={`cursor-pointer hover:underline ${showPastAppointments ? "" : "hidden"}`}
                    onClick={() => setShowAllPast(!showAllPast)} >{showAllPast ? "Retour" : "Voir tout"}</p>
                </div>
        </div>
    );
};

export default HomeAppointment;