import React from 'react';
import { Button } from "./ui/button";
import { Trash2, Edit, User } from "lucide-react";

const PlayerTable = ({ players, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 font-bold uppercase text-xs text-slate-500 tracking-wider">Player</th>
            <th className="p-4 font-bold uppercase text-xs text-slate-500 tracking-wider">Role</th>
            <th className="p-4 font-bold uppercase text-xs text-slate-500 tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{player.firstName} {player.lastName}</p>
                  <p className="text-xs text-slate-500">{player.email}</p>
                </div>
              </td>
              <td className="p-4 font-medium text-slate-600">{player.role}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(player)} className="text-blue-600 hover:bg-blue-50">
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(player.id)} className="text-red-600 hover:bg-red-50">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;