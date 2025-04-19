import { object, string } from "yup";
import { useSearchParam } from "react-use";
import { TabPanel } from "@headlessui/react";
import { Formik, Form, Field } from "formik";
import { MdOutlineEmail } from "react-icons/md";

import { globalActions } from "../../store/global";
import { useAppDispatch } from "../../store/hooks";

type SignUpTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SignUpTab({ as = TabPanel, onNext }: SignUpTabProps) {
  const As = as;
  const dispatch = useAppDispatch();
  const email = useSearchParam("email");

  return (
    <As className="flex-1 flex flex-col p-4">
      <Formik
        initialValues={{ email: email ?? "" }}
        validationSchema={object({
          email: string().email().required(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          dispatch(globalActions.setCustomer(values));
          onNext();
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, errors }) => (
          <Form className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col space-y-2">
                <div className="group flex items-center border-1 border-stone-700 rounded focus-within:border-violet-700">
                  <MdOutlineEmail className="text-xl ml-2 text-stone-500 group-focus-within:text-violet-700 dark:text-stone" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    className="flex-1 p-3 bg-transparent !outline-none placeholder-text-stone-500 dark:placeholder-text-stone-400"
                  />
                </div>
                {errors.email ? (
                  <small className="text-red text-xs first-letter:uppercase">
                    {errors.email.slice(0, 1).toUpperCase()}
                    {errors.email.slice(1)}
                  </small>
                ) : (
                  <p className="text-xs text-black/75 dark:text-stone-300">
                    Get transaction updates and reciept notifications via email.
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="!bg-violet-700 text-white py-3 rounded-md"
            >
              Continue
            </button>
          </Form>
        )}
      </Formik>
    </As>
  );
}
