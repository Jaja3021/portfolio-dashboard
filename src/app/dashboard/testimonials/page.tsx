import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { getAllTestimonials } from "@/lib/data";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();
  return <TestimonialsManager initialTestimonials={testimonials} />;
}
