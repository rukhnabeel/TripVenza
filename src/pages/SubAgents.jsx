import React from 'react';
import { UserPlus, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';

const SubAgentCard = ({ name, agency, location, email, phone, activeApps, commission }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{agency}</p>
                </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-3 text-gray-400" />
                {email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <Phone size={16} className="mr-3 text-gray-400" />
                {phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-3 text-gray-400" />
                {location}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Active Apps</p>
                <p className="text-lg font-bold text-gray-900">{activeApps}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Commission</p>
                <p className="text-lg font-bold text-green-600">{commission}%</p>
            </div>
        </div>
    </div>
);

const SubAgents = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sub-Agents Management</h1>
                    <p className="text-gray-500 mt-1">Manage your network of sub-agents and their permissions.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center">
                    <UserPlus size={20} className="mr-2" />
                    Add Sub-Agent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SubAgentCard
                    name="Rajesh Kumar"
                    agency="Sky High Travels"
                    location="New Delhi, India"
                    email="rajesh@skytravels.com"
                    phone="+91 98765 43210"
                    activeApps="24"
                    commission="12"
                />
                <SubAgentCard
                    name="Sarah Wilson"
                    agency="Global Visas Ltd"
                    location="Mumbai, India"
                    email="sarah@globalvisas.com"
                    phone="+91 87654 32109"
                    activeApps="18"
                    commission="10"
                />
                <SubAgentCard
                    name="Amit Patel"
                    agency="Patel Tours"
                    location="Ahmedabad, India"
                    email="amit@pateltours.com"
                    phone="+91 76543 21098"
                    activeApps="42"
                    commission="15"
                />
                <SubAgentCard
                    name="Priya Singh"
                    agency="Dream Destinations"
                    location="Bangalore, India"
                    email="priya@dreamdest.com"
                    phone="+91 65432 10987"
                    activeApps="7"
                    commission="8"
                />
            </div>
        </div>
    );
};

export default SubAgents;
