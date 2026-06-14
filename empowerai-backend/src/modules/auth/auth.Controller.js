const supabase = require('../../db/supabase');
const logger = require('../../utils/logger');

exports.register = async (req, res, next) => {
  try {
    // Registration can be disabled via REGISTRATION_ENABLED=false
    if (process.env.REGISTRATION_ENABLED === 'false') {
      return res.status(503).json({
        status: 'error',
        message: 'New registrations are temporarily closed. Please check back soon.',
      });
    }

    const { name, email, password, age, province, education, skills, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
    }

    // Create the auth user — sends verification email automatically
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.code === 'email_exists' || (authError.status === 422 && authError.message?.includes('already'))) {
        return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });
      }
      logger.error('Supabase auth.admin.createUser error', { message: authError.message });
      return res.status(400).json({ status: 'error', message: authError.message });
    }

    // Create the public profile row
    const { error: profileError } = await supabase.from('users').upsert({
      id: authData.user.id,
      name,
      email,
      role: 'user',
      province: province || null,
      education: education || null,
      age: age || null,
      skills: skills || [],
      interests: interests || [],
    }, { onConflict: 'id' });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      logger.error('Profile upsert error after registration', { message: profileError.message });
      throw profileError;
    }

    logger.info('User registered', { id: authData.user.id, email });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: { id: authData.user.id, name, email },
      },
    });
  } catch (error) {
    logger.error('Register controller error', { message: error.message });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logger.warn('Login failed', { email, message: error.message });
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, role, province, skills, avatar')
      .eq('id', data.user.id)
      .maybeSingle();

    logger.info('User logged in', { id: data.user.id, email });

    res.json({
      status: 'success',
      data: {
        token: data.session.access_token,
        user: profile || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: 'user',
        },
      },
    });
  } catch (error) {
    logger.error('Login controller error', { message: error.message });
    next(error);
  }
};

exports.validate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, role, province, skills, avatar')
      .eq('id', authUser.id)
      .maybeSingle();

    res.json({
      status: 'success',
      data: {
        user: profile || {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name,
          role: 'user',
        },
      },
    });
  } catch (error) {
    logger.error('Validate controller error', { message: error.message });
    next(error);
  }
};

exports.logout = (_req, res) => {
  // JWT is stateless — the client must discard the token.
  // No server-side action needed; this endpoint exists for client symmetry.
  res.json({ status: 'success', message: 'Logged out successfully' });
};
