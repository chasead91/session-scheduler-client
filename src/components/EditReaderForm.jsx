import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form"
import { useParams, useNavigate } from 'react-router-dom';
import { editReader, getReader } from '../api/readers';

export default function EditReaderForm() {
  const { record_id } = useParams()
  const [readerData, setReaderData] = useState({})
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    // 1. Fetch sessions when component mounts
    getReader(record_id)
      .then((data) => {
        setReaderData(data[0]);
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
  } = useForm({
    defaultValues: {name:"Chase", offering:"", location:"", bio:""},
    values: readerData
  })


const onSubmit = async (data) => {
    setError(null);
    try {
      await editReader(record_id,data);
      navigate('/admin')
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {return <div>Loading reader...</div>};

  return (
    <>
<div className="min-h-screen bg-base-200 text-base-content p-6 lg:p-10 flex justify-center items-start font-sans">
  <div className="w-full max-w-2xl space-y-6">
    
    {/* Page Header */}
    <header className="border-b border-base-300 pb-4">
      <h1 className="text-3xl font-black text-primary tracking-tight">Edit Reader</h1>
      <p className="text-sm text-base-content/70 mt-1">
        Update reader profile details, station assignment, or offerings.
      </p>
    </header>

    {/* Form Card */}
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6 md:p-8">
        
        {/* Global Success Alert */}
        {successMessage && (
          <div className="alert alert-success shadow-sm mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">Form Submitted Successfully</span>
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
          <div className="alert alert-error shadow-sm mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">Error: {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Top Row: Name & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name Input */}
            <div className="form-control w-full">
              <label className="label pt-0">
                <span className="label-text font-semibold">Reader Name</span>
              </label>
              <input 
                type="text"
                placeholder="e.g., Luna Star"
                className={`input input-bordered w-full focus:input-primary ${errors.name ? 'input-error' : ''}`}
                {...register("name", { required: true })} 
              />
              {errors.name && (
                <label className="label pb-0">
                  <span className="label-text-alt text-error font-medium">This field is required</span>
                </label>
              )}
            </div>

            {/* Location Input */}
            <div className="form-control w-full">
              <label className="label pt-0">
                <span className="label-text font-semibold">Location / Table</span>
              </label>
              <input 
                type="text"
                placeholder="e.g., Table 4 or Tent A"
                className={`input input-bordered w-full focus:input-primary ${errors.location ? 'input-error' : ''}`}
                {...register("location", { required: true })} 
              />
              {errors.location && (
                <label className="label pb-0">
                  <span className="label-text-alt text-error font-medium">This field is required</span>
                </label>
              )}
            </div>

          </div>

          {/* Session Types / Offering */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Session Type(s)</span>
            </label>
            <input 
              type="text"
              placeholder="e.g., Tarot, Astrology, Palmistry"
              className={`input input-bordered w-full focus:input-primary ${errors.offering ? 'input-error' : ''}`}
              {...register("offering", { required: true })} 
            />
            {errors.offering && (
              <label className="label pb-0">
                <span className="label-text-alt text-error font-medium">This field is required</span>
              </label>
            )}
          </div>

          {/* Bio Textarea */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Reader Bio</span>
            </label>
            <textarea 
              rows={4}
              placeholder="Brief description of experience and readings offered..."
              className={`textarea textarea-bordered w-full focus:textarea-primary text-base ${errors.bio ? 'textarea-error' : ''}`}
              {...register("bio", { required: true })} 
            />
            {errors.bio && (
              <label className="label pb-0">
                <span className="label-text-alt text-error font-medium">This field is required</span>
              </label>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex justify-end items-center gap-3 border-t border-base-200">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn btn-primary px-8"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving Changes...
                </>
              ) : (
                "Update Reader"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</div>
    </>
  )
};