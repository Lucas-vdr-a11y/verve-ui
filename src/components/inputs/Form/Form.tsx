import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";
import "./Form.css";

/** A bag of field values keyed by field name. */
export type FormValues = Record<string, unknown>;

/** A bag of validation errors keyed by field name (absent = valid). */
export type FormErrors = Record<string, string | undefined>;

/** Per-field validation/registration options. */
export interface FieldOptions {
  /** Require a non-empty value. Pass a string to customize the message. */
  required?: boolean | string;
  /**
   * Custom validator. Return a string error message, or `undefined`/`null`
   * when the value is valid.
   */
  validate?: (value: unknown, values: FormValues) => string | undefined | null;
}

/** Props returned by `register()` to spread onto a controlled input. */
export interface FieldRegistration {
  name: string;
  value: unknown;
  onChange: (e: { target: { value: unknown } } | unknown) => void;
  onBlur: () => void;
  "aria-invalid"?: boolean;
}

export interface FormApi<V extends FormValues = FormValues> {
  /** Current field values. */
  values: V;
  /** Current field errors (after validation / touch). */
  errors: FormErrors;
  /** Fields the user has interacted with (focused then blurred). */
  touched: Record<string, boolean>;
  /** Whether any field currently has an error. */
  isValid: boolean;
  /** Set a single field's value (and validate if already touched). */
  setValue: (name: string, value: unknown) => void;
  /** Set a single field's error message (or clear with `undefined`). */
  setError: (name: string, error: string | undefined) => void;
  /** Register a field's options + validators (idempotent). */
  registerField: (name: string, options?: FieldOptions) => void;
  /** Get spreadable props for a controlled input. */
  register: (name: string, options?: FieldOptions) => FieldRegistration;
  /** Validate every registered field; returns true if all pass. */
  validateAll: () => boolean;
  /** Reset values/errors/touched back to the initial values. */
  reset: (next?: V) => void;
  /** Mark a field touched and validate it. */
  blurField: (name: string) => void;
}

const FormContext = createContext<FormApi | null>(null);

/** Access the nearest enclosing form. Throws if used outside a `<Form>`. */
export function useFormContext<V extends FormValues = FormValues>(): FormApi<V> {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error("useFormContext must be used within a <Form> / FormProvider");
  }
  return ctx as FormApi<V>;
}

function isEmpty(value: unknown): boolean {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Standalone form state hook. Wire the returned `api` into `<FormProvider>` or
 * use it directly. Dependency-free and controlled-values based.
 */
export function useForm<V extends FormValues = FormValues>(
  initialValues: V = {} as V
): FormApi<V> {
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldsRef = useRef<Record<string, FieldOptions>>({});
  // Keep a live ref of values so validators always see the latest snapshot.
  const valuesRef = useRef<V>(values);
  valuesRef.current = values;

  const runValidation = useCallback(
    (name: string, value: unknown, all: FormValues): string | undefined => {
      const opts = fieldsRef.current[name];
      if (!opts) return undefined;
      if (opts.required && isEmpty(value)) {
        return typeof opts.required === "string"
          ? opts.required
          : "This field is required";
      }
      if (opts.validate) {
        const result = opts.validate(value, all);
        if (result) return result;
      }
      return undefined;
    },
    []
  );

  const setValue = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value } as V;
        valuesRef.current = next;
        return next;
      });
      setErrors((prev) => {
        // Re-validate eagerly only if the field was already touched.
        if (!touched[name]) return prev;
        const msg = runValidation(name, value, {
          ...valuesRef.current,
          [name]: value,
        });
        return { ...prev, [name]: msg };
      });
    },
    [runValidation, touched]
  );

  const setError = useCallback((name: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const registerField = useCallback((name: string, options?: FieldOptions) => {
    fieldsRef.current[name] = options ?? {};
  }, []);

  const blurField = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const msg = runValidation(name, valuesRef.current[name], valuesRef.current);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    },
    [runValidation]
  );

  const register = useCallback(
    (name: string, options?: FieldOptions): FieldRegistration => {
      registerField(name, options);
      return {
        name,
        value: values[name] ?? "",
        onChange: (e: unknown) => {
          const value =
            e != null &&
            typeof e === "object" &&
            "target" in e &&
            (e as { target?: { value?: unknown } }).target != null
              ? (e as { target: { value: unknown } }).target.value
              : e;
          setValue(name, value);
        },
        onBlur: () => blurField(name),
        "aria-invalid": errors[name] ? true : undefined,
      };
    },
    [registerField, values, errors, setValue, blurField]
  );

  const validateAll = useCallback((): boolean => {
    const nextErrors: FormErrors = {};
    const allTouched: Record<string, boolean> = {};
    let ok = true;
    for (const name of Object.keys(fieldsRef.current)) {
      const msg = runValidation(name, valuesRef.current[name], valuesRef.current);
      nextErrors[name] = msg;
      allTouched[name] = true;
      if (msg) ok = false;
    }
    setErrors(nextErrors);
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return ok;
  }, [runValidation]);

  const reset = useCallback(
    (next?: V) => {
      const base = next ?? initialValues;
      setValues(base);
      valuesRef.current = base;
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  const isValid = useMemo(
    () => Object.values(errors).every((e) => !e),
    [errors]
  );

  return useMemo(
    () => ({
      values,
      errors,
      touched,
      isValid,
      setValue,
      setError,
      registerField,
      register,
      validateAll,
      reset,
      blurField,
    }),
    [
      values,
      errors,
      touched,
      isValid,
      setValue,
      setError,
      registerField,
      register,
      validateAll,
      reset,
      blurField,
    ]
  );
}

/** Subscribe to a single field. Convenience over `useFormContext`. */
export function useField<T = unknown>(name: string, options?: FieldOptions) {
  const form = useFormContext();
  // Register options once on first use (and whenever they change identity).
  form.registerField(name, options);
  return {
    value: form.values[name] as T | undefined,
    error: form.errors[name],
    touched: !!form.touched[name],
    setValue: (value: T) => form.setValue(name, value),
    onBlur: () => form.blurField(name),
  };
}

export interface FormProviderProps {
  /** The form API, typically from `useForm()`. */
  form: FormApi;
  children: React.ReactNode;
}

/** Provides a form API to descendants without rendering a `<form>` element. */
export function FormProvider({ form, children }: FormProviderProps) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

export interface FormProps<V extends FormValues = FormValues>
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit" | "onInvalid" | "children"
  > {
  /** An existing form API. When omitted, one is created from `initialValues`. */
  form?: FormApi<V>;
  /** Initial values when `form` is not supplied. */
  initialValues?: V;
  /** Called with the current values after validation passes. */
  onSubmit?: (values: V, api: FormApi<V>) => void;
  /** Called when submit is attempted but validation fails. */
  onInvalid?: (errors: FormErrors, api: FormApi<V>) => void;
  /** Render children, or a function receiving the form API. */
  children?: React.ReactNode | ((api: FormApi<V>) => React.ReactNode);
}

/**
 * Lightweight form wrapper. Renders a `<form>`, prevents default on submit,
 * runs validation, and exposes the form API via context + an optional
 * render-prop.
 */
export const Form = forwardRef(function Form<V extends FormValues = FormValues>(
  {
    form: externalForm,
    initialValues,
    onSubmit,
    onInvalid,
    className,
    children,
    noValidate = true,
    ...rest
  }: FormProps<V>,
  ref: React.Ref<HTMLFormElement>
) {
  // When no external form is provided, create an internal one. The hook order
  // is stable because a component either always passes `form` or never does.
  const internalForm = useForm<V>(initialValues ?? ({} as V));
  const form = externalForm ?? internalForm;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = form.validateAll();
    if (ok) onSubmit?.(form.values, form);
    else onInvalid?.(form.errors, form);
  };

  return (
    <FormContext.Provider value={form as FormApi}>
      <form
        ref={ref}
        className={cn("nova-form", className)}
        onSubmit={handleSubmit}
        noValidate={noValidate}
        {...rest}
      >
        {typeof children === "function"
          ? (children as (api: FormApi<V>) => React.ReactNode)(form)
          : children}
      </form>
    </FormContext.Provider>
  );
}) as <V extends FormValues = FormValues>(
  props: FormProps<V> & { ref?: React.Ref<HTMLFormElement> }
) => React.ReactElement;
