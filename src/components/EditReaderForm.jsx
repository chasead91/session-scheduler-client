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
    <form onSubmit={handleSubmit(onSubmit)}>
      {successMessage && (<span>Form Submitted Successfully</span>)}
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