import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, Mail, Calendar, ShieldCheck, Ticket, Settings, ArrowRight, Edit2, Save, X, Lock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import { updateUserData, changePassword } from '../../services/userService';
import { hasRole } from "../../services/authService";

const Profile = ({ user }) => {
    const navigate = useNavigate();
    const [myReservations, setMyReservations] = useState([]);

    // Local state for the user data
    const [currentUser, setCurrentUser] = useState(user);

    // State for Edit Mode (Profile Details)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        surname: ''
    });

    // NEW: State for Password Change Modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const isManager = hasRole('ROLE_ORGANIZATION_MANAGER');

    // Sync props to local state
    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                name: user.name || '',
                surname: user.surname || ''
            });
        }
    }, [user]);

    // Load reservations
    useEffect(() => {
        // Controlliamo se c'è l'ID invece della mail
        if (currentUser?.id) {
            reservationService.getReservationByUserId(currentUser.id) // <--- Passiamo l'ID!
                .then(setMyReservations)
                .catch(err => console.error("Could not load reservations", err));
        }
    }, [currentUser.id]);

    // --- HANDLERS ---

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NEW: Handle Password Input Changes
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    // NEW: Submit Password Change
    const submitPasswordChange = async () => {
        // 1. Basic Validation
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        try {
            // 2. Call the Service
            await changePassword(currentUser.id, passwordForm.oldPassword, passwordForm.newPassword);

            // 3. Success Feedback
            alert("Password changed successfully!");
            setIsPasswordModalOpen(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (error) {
            console.error("Password change failed", error);
            if (error.response && error.response.status === 401) {
                alert("The current password you entered is incorrect.");
            } else {
                alert("Failed to change password. Please try again.");
            }
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
            alert("Update failed. Please check your data.");
        }
    };

    // --- HELPER PER VISUALIZZARE IL RUOLO ---
    // Gestisce sia oggetti {roleName: '...'} che stringhe 'ROLE_...'
    const getRoleLabel = () => {
        if (!currentUser.roles || currentUser.roles.length === 0) return 'Not specified';

        const roleObj = currentUser.roles[0];
        // Se è un oggetto prendi .roleName, altrimenti usa la stringa diretta
        const roleString = typeof roleObj === 'object' ? roleObj.roleName : roleObj;

        return roleString.replace('ROLE_', '').replace('_', ' ');
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl relative">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-4 rounded-full text-white shadow-lg">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            Profile <span className="text-blue-600">Overview</span>
                        </h1>
                        <p className="text-slate-500 flex items-center gap-1">
                            <ShieldCheck size={16} className="text-blue-600" />
                            Role: <span className="font-semibold text-blue-600">
                                {/* USIAMO LA FUNZIONE HELPER QUI */}
                            {getRoleLabel()}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex gap-2">
                    {!isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                                <Edit2 size={16} /> Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="gap-2">
                                <X size={16} /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <Save size={16} /> Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Personal Information */}
                <Card className={`shadow-md border-none bg-white ${isEditing ? 'ring-2 ring-blue-400' : ''}`}>
                    <CardHeader className="pb-2 border-b mb-4">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">First Name</p>
                            {isEditing ? (
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg font-bold text-slate-800">{currentUser.name}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Last Name</p>
                            {isEditing ? (
                                <input
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-lg font-bold text-slate-800">{currentUser.surname}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info + Password Change */}
                <Card className="shadow-md border-none bg-white flex flex-col h-full">
                    <CardHeader className="pb-2 border-b mb-4">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} /> Account Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Email Address (Read Only)</p>
                            <p className="text-lg font-bold text-slate-800 break-all opacity-80 cursor-not-allowed">
                                {currentUser.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Account Status</p>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700 uppercase">
                                Active
                            </span>
                        </div>

                        {/* NEW: Password Change Button Area */}
                        <div className="pt-4 mt-auto">
                            <Button
                                variant="outline"
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                                <Lock size={16} /> Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Conditional Section: Manager Dashboard or User Tickets */}
            {isManager ? (
                <Card className="shadow-xl border-2 border-blue-600 bg-slate-900 text-white">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Settings className="text-blue-400" /> Management Tools
                            </h2>
                            <p className="text-slate-400">Access global reservations and system controls.</p>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/reservations')}
                            className="bg-blue-600 hover:bg-blue-500 font-bold px-8 py-6 text-lg transition-transform hover:scale-105"
                        >
                            Manage Reservations <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                        <Ticket className="text-blue-600" /> Your Tickets
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {myReservations.length > 0 ? (
                            myReservations.map((res) => (
                                <Card key={res.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="space-y-1 text-center md:text-left">
                                            <p className="text-xl font-bold text-slate-800">{res.matchName || "Tournament Match"}</p>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1"><Calendar size={14}/> {res.date || "Upcoming"}</span>
                                                <span className="font-bold text-blue-600 underline">Seats: {res.seatCount}</span>
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
                                <CardContent className="p-10 text-center text-slate-400 italic">
                                    You haven't booked any matches yet. Visit the tournaments page to grab your tickets!
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* --- NEW: CHANGE PASSWORD MODAL --- */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black italic uppercase text-slate-900">
                                Change Password
                            </h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Current Password</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordForm.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <hr className="border-slate-100 my-2"/>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="ghost"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="text-slate-500 hover:text-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitPasswordChange}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;