import configs from '../configs'

export default {
  email: {
    verification: {
      message: `A verification link has been sent to your email, check your inbox or spam.`,
      subject: `Email Address Verification`,
      intro: `Welcome to ${configs.app.name}!`,
      text: `Confirm Your Account`,
      instructions: `To enjoy our amazing services, please click the button below to complete your registration.`,
      outro: `Need help, or have questions? Just reply to this email, we would love to help.`
    },

    password: {
      message: `A password link has been sent to your email, check your inbox or spam.`,
      subject: `Password Reset`,
      intro: `You have received this email because a password reset request for your account was received.`,
      text: `Reset your password`,
      instructions: `To get started, please click here:`,
      outro: `If you did not request a password reset, please ignore the message.`
    },
    verified: `Email address successfully verified`
  },

  error: {
    notFound: `:value not found`,
    required: `:value is required`,
    empty: `:value cannot be empty`,
    verified: `Account has been verified and activated`,
    server: `Internal error occurred, please contact support!`,
    conflict: ':value already exist',
    unauthorized: `You do not have the privilege for this operation`,
    password: {
      invalid: `Invalid password reset link`,
      expired: `Update password link has expired`,
      used: `Password reset link has already been used`,
      same: `New password must be different from old password`
    },
    email: {
      conflict: `Email address has been used`,
      invalid: `Email address has not been registered`
    },
    verification: {
      invalid: `Invalid verification link`,
      expired: `Verification link has expired`
    },
    authentication: {
      invalid: 'Invalid authentication token',
      notFound: `Authentication token not provided`
    },
    pagination: {
      page: `Page number cannot be less than 1`,
      invalid: `:value must be a positive integer`,
      minItems: `Paginated items per page cannot be less than :value`,
      maxItems: `Paginated items per page cannot be greater than :value`
    },
    file: {
      required: `No :value was uploaded`,
      invalid: `File format must be one of :value`
    }
  },
  
  authentication: {
    invalid: 'Invalid email and password',
    required: 'Email and password are required',
    success: 'User authentication successful',
    expired: `Authentication token has expired`,
    unverified: `Please confirm your email address to activate your account`,
    token: {
      notFound: `Authentication token not provided`,
    }
  },

  entity: {
    created: `:value successfully created`,
    updated: `:value successfully updated`,
    deleted: `:value successfully deleted`,
    retrieved: `:value successfully retrieved`,
    emptyList: `:value list is currently empty`,
    file: {
      removed: `:value successfully removed`,
    }
  }
}