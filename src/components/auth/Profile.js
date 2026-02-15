import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, Mail, Calendar, ShieldCheck, Ticket, Settings, ArrowRight, Edit2, Save, X, Lock, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import { updateUserData, changePassword } from '../../services/userService';
import { hasRole } from "../../services/authService";

const Profile = ({ user }) => {
    const navigate = useNavigate();
    const [myReservations, setMyReservations] = useState([]);
    const [loadingRes, setLoadingRes] = useState(false);

    // Initial user retrieval (props or localStorage)
    const [currentUser, setCurrentUser] = useState(() => {
        if (user && user.id) return user;
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        surname: currentUser?.surname || ''
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const isManager = hasRole('ROLE_ORGANIZATION_MANAGER');

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            setFormData({ name: user.name || '', surname: user.surname || '' });
        }
    }, [user]);

    // Loading reservations based on the Entity's numeric ID
    useEffect(() => {
        const fetchReservations = async () => {
            const userId = currentUser?.id;
            if (userId) {
                setLoadingRes(true);
                try {
                    // We pass Number(userId) for consistency with Java's Long
                    const data = await reservationService.getReservationByUserId(Number(userId));
                    setMyReservations(data);
                } catch (err) {
                    console.error("Could not load reservations", err);
                } finally {
                    setLoadingRes(false);
                }
            }
        };
        fetchReservations();
    }, [currentUser?.id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const submitPasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            await changePassword(currentUser.id, passwordForm.oldPassword, passwordForm.newPassword);
            alert("Password changed successfully!");
            setIsPasswordModalOpen(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.status === 401 ? "Current password incorrect." : "Failed to change password.");
        }
    };

    const handleSave = async () => {
        try {
            const updatedUser = await updateUserData(currentUser.id, formData);
            setCurrentUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsEditing(false);
            alert("Profile updated!");
        } catch (error) {
            alert("Update failed.");
        }
    };

    const getRoleLabel = () => {
        if (!currentUser?.roles || currentUser.roles.length === 0) return 'Guest';
        const roleObj = currentUser.roles[0];
        const roleString = typeof roleObj === 'object' ? roleObj.roleName : roleObj;
        return roleString.replace('ROLE_', '').replace('_', ' ');
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-4 rounded-full text-white shadow-lg">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            Profile <span className="text-blue-600">Overview</span>
                        </h1>
                        <p className="text-slate-500 flex items-center gap-1 uppercase text-xs font-bold tracking-widest">
                            <ShieldCheck size={14} className="text-blue-600" />
                            Role: <span className="text-blue-600">{getRoleLabel()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 border-blue-600 text-blue-600">
                            <Edit2 size={16} /> Edit
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}><X size={16} /></Button>
                            <Button onClick={handleSave} className="bg-green-600 text-white"><Save size={16} /> Save</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-md border-none bg-white">
                    <CardHeader className="pb-2 border-b mb-4">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">First Name</p>
                            {isEditing ? <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" /> : <p className="text-lg font-bold">{currentUser?.name}</p>}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Last Name</p>
                            {isEditing ? <input name="surname" value={formData.surname} onChange={handleInputChange} className="w-full p-2 border rounded" /> : <p className="text-lg font-bold">{currentUser?.surname}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md border-none bg-white">
                    <CardHeader className="pb-2 border-b mb-4">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} /> Account Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                            <p className="text-lg font-bold opacity-80">{currentUser?.email}</p>
                        </div>
                        <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)} className="w-full gap-2"><Lock size={16} /> Change Password</Button>
                    </CardContent>
                </Card>
            </div>

            {isManager ? (
                <Card className="shadow-xl border-2 border-blue-600 bg-slate-900 text-white">
                    <CardContent className="p-8 flex justify-between items-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black italic uppercase italic tracking-tighter flex items-center gap-2"><Settings className="text-blue-400" /> Management Tools</h2>
                            <p className="text-slate-400">Access global reservations and controls.</p>
                        </div>
                        <Button onClick={() => navigate('/admin/reservations')} className="bg-blue-600">Manage <ArrowRight className="ml-2" /></Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                        <Ticket className="text-blue-600" /> Your Tickets
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {loadingRes ? (
                            <div className="text-center py-10"><Loader2 className="animate-spin inline text-blue-600" /></div>
                        ) : myReservations.length > 0 ? (
                            myReservations.map((res) => (
                                <Card key={res.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow border-l-4 border-blue-600">
                                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="space-y-1 text-center md:text-left">
                                            {/* Aligned with ReservationEntity: we use matchId and seatNumber */}
                                            <p className="text-xl font-black uppercase italic text-slate-800">Match Reservation</p>
                                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                                <span className="flex items-center gap-1"><Ticket size={14} className="text-blue-600"/> ID Match: {res.matchId}</span>
                                                <span className="text-blue-600">Seat: {res.seatNumber || "General"}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200 text-center min-w-[150px]">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Booking Code</p>
                                            <p className="text-2xl font-mono font-black text-blue-600 tracking-tighter">#{res.id}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-dashed border-2 bg-transparent">
                                <CardContent className="p-10 text-center text-slate-400 italic font-medium uppercase tracking-widest text-xs">
                                    No tickets found. Visit the matches page to book your seat!
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Change Password */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-black italic uppercase text-slate-900 mb-6">Change Password</h3>
                        <div className="space-y-4">
                            <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg" placeholder="Current Password" />
                            <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg" placeholder="New Password" />
                            <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg" placeholder="Confirm New Password" />
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                            <Button onClick={submitPasswordChange} className="bg-blue-600 text-white font-bold uppercase italic">Update</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;