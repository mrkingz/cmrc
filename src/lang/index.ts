import configs from '../configs'

export default {
  email: {
    verification: {
      message: `A verification link has been sent to your email, check your inbox or spam.`,
      subject: `Email address verification`,
      intro: `Welcome to ${configs.app.name}!`,
      text: `Confirm Your Account`,
      instructions: `To enjoy our amazing services, please click the button below to complete your registration.`,
      outro: `Need help, or have questions? Just reply to this email, we would love to help.`
    },

    resetPassword: {
      message: `A verification link has been sent to your email, check your inbox or spam.`,
      subject: `Email address verification`,
      intro: `You have received this email because a password reset request for your account was received.`,
      text: `Reset your password`,
      instructions: `To get started, please click here:`,
      outro: `If you did not request a password reset, please ignore the message.`
    },
    verified: `Email address successfully verified`
  },

  error: {
    expired: `:value link has expired`,
    invalid: `Invalid :value link`,
    verified: `:value link has already been used`,
    notFound: `:value not found`,
    server: `Internal error occured, try again later!`
  },

  entity: {
    created: `:value successfully created`,
    updated: `:value successfully updated`,
    deleted: `:value successfully deleted`,
  }
}