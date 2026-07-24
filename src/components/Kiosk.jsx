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


  if (loading) {return <div>Loading readers...</div>};

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      {successMessage && (<span>Form Submitted Successfully</span>)}
      {error && (<div>Error: {error}</div>)}
      {errors['reader-list'] && (<div>Error: {errors['reader-list'].message}</div>)}
      {/* include validation with required or other standard HTML validation rules */}
      <input {...register("name", { required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.name && <span>This field is required</span>}

      <ul style={{'listStyle':'none'}}>
        {readers.map((reader) => (
          <li key={reader.reader_id}>
            <label>
              {reader.name}
              <input
                type="checkbox"
                value={reader.reader_id}
                {...register("reader-list", {
                  required: "Please select at least one reader"
                })}
              />
            </label>
          </li>
        ))}
      </ul>

      <input type="submit" disabled={isSubmitting} value={isSubmitting ? "Submitting..." : "Submit"} />
    </form>
    </>
  )
}