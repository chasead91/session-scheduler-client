import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form"
import { getReaders } from '../api/readers';
import { createSitter } from "../api/sitters"

export default function Kiosk() {

  const [readers, setReaders] = useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    console.log('I fire once')
    // 1. Fetch sessions when component mounts
    getReaders()
      .then((data) => {
        setReaders(data);
        console.log(data)
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs once on mount


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm()


  const onSubmit = async (data) => {
    setError(null);
    setSuccessMessage("");
    try {
      const name = data.name;
      const reader_list = data['reader-list'];
      await createSitter(name, reader_list);

      setSuccessMessage("Some great tune")
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

      return () => clearTimeout(timer); // Cleanup timeout on unmount
    } catch (err) {
      setError(err.message);
    }
  };

  // Safely reset the form after a successful submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();

    }
  }, [isSubmitSuccessful, reset]);


  if (loading) { return <div>Loading readers...</div> };

  return (
<div className="bg-base-200 py-8 px-4 flex justify-center items-center">
  <div className="card w-full max-w-2xl bg-base-100 shadow-xl border border-base-300">
    <div className="card-body p-6 md:p-10">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
          Quirky Wellness Center
        </h1>
        <p className="text-lg font-medium text-base-content/70 mt-1">
          Deserts & Divination
        </p>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="alert alert-success shadow-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Form submitted successfully!</span>
        </div>
      )}

      {(error || errors['reader-list']) && (
        <div className="alert alert-error shadow-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error || errors['reader-list']?.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Name Input Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold text-base">Your Name</span>
          </label>
          <input 
            type="text" 
            placeholder="e.g., Jane Doe"
            className={`input input-bordered w-full text-base ${errors.name ? 'input-error' : 'focus:input-primary'}`}
            {...register("name", { required: true })} 
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error font-medium">This field is required</span>
            </label>
          )}
        </div>

        {/* Reader Selection List */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-semibold text-base">Select Your Reader(s)</span>
          </label>
          
          <div className="grid grid-cols-1 gap-3 mt-1">
            {readers.map((reader) => (
              <label 
                key={reader.reader_id} 
                className="label cursor-pointer justify-between border border-base-300 hover:border-primary rounded-lg p-4 transition-colors bg-base-100"
              >
                <div className='flex flex-col'>
                <span className="label-text text-base">{reader.name}</span>
                <span className="label-text text-sm uppercase text-base">{reader.offering}</span>
                <span className="label-text text-xs text-base">{reader.bio}</span>
                </div>
                <input
                  type="checkbox"
                  value={reader.reader_id}
                  className="checkbox checkbox-primary"
                  {...register("reader-list", {
                    required: "Please select at least one reader"
                  })}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary w-full text-lg shadow-md"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Submitting...
              </>
            ) : (
              "Submit Booking"
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>
  )
}