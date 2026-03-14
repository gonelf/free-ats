import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const member = await db.member.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const org = member.organization;

    // Check if email already a member via existing invitations accepted
    const existingMember = await db.member.findFirst({
      where: { organizationId: org.id },
    });
    // (We can't check by email directly since Member stores userId, not email)

    // Check for existing pending invitation
    const existingInvite = await db.invitation.findFirst({
      where: {
        organizationId: org.id,
        email: normalizedEmail,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 409 }
      );
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await db.invitation.create({
      data: {
        organizationId: org.id,
        email: normalizedEmail,
        role: role || "MEMBER",
        expiresAt,
      },
    });

    // Send invitation email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const acceptUrl = `${appUrl}/invitations/accept?token=${invitation.token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@freeats.app",
        to: normalizedEmail,
        subject: `You've been invited to join ${org.name} on KiteHR`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <div style="margin-bottom: 24px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #4f46e5; border-radius: 8px; margin-bottom: 16px;">
                <span style="color: white; font-size: 18px;">📋</span>
              </div>
              <h1 style="font-size: 22px; font-weight: bold; color: #111827; margin: 0 0 8px;">
                You're invited to join ${org.name}
              </h1>
              <p style="color: #6b7280; font-size: 15px; margin: 0;">
                You've been invited to collaborate on <strong>${org.name}</strong>'s hiring pipeline on KiteHR.
              </p>
            </div>

            <a href="${acceptUrl}"
               style="display: block; background: #4f46e5; color: white; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
              Accept Invitation
            </a>

            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 8px; word-break: break-all;">
              Or copy this link: ${acceptUrl}
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (error) {
    console.error("[Invitation Error]", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
