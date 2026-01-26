import { CalendarDays } from "lucide-react";

<Table>
  <TableHeader className="bg-slate-50 border-b">
    <TableRow>
      <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12">Official Name</TableHead>
      <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-center">Birth Date</TableHead>
      <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-center">Role</TableHead>
      {isManager && <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-right pr-8">Actions</TableHead>}
    </TableRow>
  </TableHeader>
  <TableBody>
    {officials.map((official) => (
      <TableRow key={official.id} className="hover:bg-slate-50 transition-colors border-b last:border-0">
        <TableCell className="py-4">
          <div className="font-bold text-slate-900 uppercase tracking-tight">{official.firstName} {official.lastName}</div>
        </TableCell>
        <TableCell className="py-4 text-center text-slate-500 font-medium">
          <div className="flex items-center justify-center gap-2">
            <CalendarDays size={14} className="text-slate-300" />
            {official.birthDate || "N/A"}
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100 inline-block">
            {official.role?.replace('_', ' ')}
          </span>
        </TableCell>
        
        {isManager && (
          <TableCell className="py-4 text-right pr-8">
            <div className="flex justify-end gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-blue-600"
                onClick={() => {
                  setSelectedOfficial(official);
                  setIsDialogOpen(true);
                }}
              >
                <Edit size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-600"
                onClick={() => handleDelete(official.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    ))}
  </TableBody>
</Table>