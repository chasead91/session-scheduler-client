import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form"
import { useParams, useNavigate } from 'react-router-dom';
import { createReader } from '../api/readers';

export default function CreateReaderForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm()


const onSubmit = async (data) => {
    setError(null);
    try {
      await createReader(data);
      navigate('/admin')
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {return <div>Loading reader...</div>};

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (<div>Error: {error}</div>)}

      {/* include validation with required or other standard HTML validation rules */}
      <label>
        Name:
        <input {...register("name", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.name && <span>This field is required</span>}
      </label>

      <label>
        Session Type(s):
        <input {...register("offering", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.offering && <span>This field is required</span>}
      </label>

      <label>
        Location:
        <input {...register("location", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.location && <span>This field is required</span>}
      </label>

      <label>
        Bio:
        <input {...register("bio", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.bio && <span>This field is required</span>}
      </label>

      <input type="submit" disabled={isSubmitting} value={isSubmitting ? "Submitting..." : "Submit"} />
    </form>
    </>
  )
};