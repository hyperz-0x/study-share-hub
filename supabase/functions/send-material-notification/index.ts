import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  materialId: string;
  action: "approved" | "rejected";
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialId, action, rejectionReason }: NotificationRequest = await req.json();

    console.log(`Processing ${action} notification for material: ${materialId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get material details with author info
    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("title, author_id")
      .eq("id", materialId)
      .single();

    if (materialError || !material) {
      console.error("Failed to fetch material:", materialError);
      throw new Error("Material not found");
    }

    // Get author profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, user_id")
      .eq("user_id", material.author_id)
      .single();

    if (profileError || !profile) {
      console.error("Failed to fetch profile:", profileError);
      throw new Error("Author profile not found");
    }

    // Get author's email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(material.author_id);

    if (userError || !user?.email) {
      console.error("Failed to fetch user email:", userError);
      throw new Error("Author email not found");
    }

    const authorEmail = user.email;
    const authorName = profile.full_name;
    const materialTitle = material.title;

    let subject: string;
    let htmlContent: string;

    if (action === "approved") {
      subject = `🎉 Your material "${materialTitle}" has been approved!`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Material Approved! 🎉</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hi <strong>${authorName}</strong>,
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Great news! Your study material <strong>"${materialTitle}"</strong> has been reviewed and approved by our admin team.
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Your material is now live and accessible to all students on the platform. Thank you for contributing to our learning community!
            </p>
            <div style="margin-top: 30px; padding: 20px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="color: #166534; margin: 0; font-weight: 600;">✅ Status: Approved</p>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>LN-StudyHub Team</strong>
            </p>
          </div>
        </div>
      `;
    } else {
      subject = `Your material "${materialTitle}" needs revision`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Material Review Update</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hi <strong>${authorName}</strong>,
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Your study material <strong>"${materialTitle}"</strong> has been reviewed by our admin team and requires some changes before it can be published.
            </p>
            <div style="margin-top: 20px; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="color: #991b1b; margin: 0 0 10px 0; font-weight: 600;">Reason for rejection:</p>
              <p style="color: #7f1d1d; margin: 0;">${rejectionReason || "No specific reason provided."}</p>
            </div>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 20px;">
              Please review the feedback, make the necessary changes, and resubmit your material. We appreciate your effort to provide quality content!
            </p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>LN-StudyHub Team</strong>
            </p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "LN-StudyHub <onboarding@resend.dev>",
      to: [authorEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-material-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
