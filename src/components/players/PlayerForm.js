import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import playerService from "../../services/playerService";

export function PlayerForm({ initialData, onSuccess }) {
  const form = useForm({
    defaultValues: initialData || {
      name: "",
      position: "",
      team: "",
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
      onSuccess(); // Function to reload the table or close the modal
    } catch (error) {
      console.error("Error during save:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position (Enum)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CHASER">Chaser</SelectItem>
                  <SelectItem value="BEATER">Beater</SelectItem>
                  <SelectItem value="KEEPER">Keeper</SelectItem>
                  <SelectItem value="SEEKER">Seeker</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jersey Number</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Update Player" : "Create Player"}
        </Button>
      </form>
    </Form>
  );
}