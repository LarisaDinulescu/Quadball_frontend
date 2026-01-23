import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import playerService from "../../services/playerService";

export function PlayerForm({ initialData, onSuccess }) {
  // Initialize form with the fields required by your backend
  const form = useForm({
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      position: "",
      jerseyNumber: ""
    },
  });

  const onSubmit = async (data) => {
    try {
      if (initialData?.id) {
        await playerService.updatePlayer(initialData.id, data);
      } else {
        await playerService.createPlayer(data);
      }
      onSuccess(); // Triggers refresh in PlayerManagement
    } catch (error) {
      console.error("Error saving player:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl><Input placeholder="John" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

      
          <FormField
            control={form.control}
            name="jerseyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jersey #</FormLabel>
                <FormControl><Input type="number" placeholder="00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Quadball Role" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CHASER">Chaser</SelectItem>
                  <SelectItem value="BEATER">Beater</SelectItem>
                  <SelectItem value="KEEPER">Keeper</SelectItem>
                  <SelectItem value="SEEKER">Seeker</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6 text-lg">
          {initialData ? "Update Player Details" : "Add Player to Roster"}
        </Button>
      </form>
    </Form>
  );
}