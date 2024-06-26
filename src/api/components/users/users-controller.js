const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const page_number = request.query.page_number || 0;
    const page_size = request.query.page_size || 0;
    const sort = request.query.sort || '';
    const search = request.query.search || '';

    // Retrieve all users
    const users = await usersService.getUsers();

    // Filter users based on the search query parameter if it exists, otherwise return all users
    const filteredUsers = search
      ? users.filter((user) => {
          const [searchField, searchKey] = search.split(':');
          // Check if fieldName is valid (either 'name' or 'email')
          if (['name', 'email'].includes(searchField))
            return user[searchField].includes(searchKey);
        })
      : users;

    // Sort users based on the sort query parameter if it exists, otherwise default to sorting by email in ascending order
    const sortedUsers = filteredUsers.sort((a, b) => {
      const [sortField, sortOrder] = sort.split(':');

      // Validate sortField and sortOrder parameters
      const field = ['name', 'email'].includes(sortField) ? sortField : 'email'; // Ensure sortField is either 'name' or 'email'
      const order = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc'; // Ensure sortOrder is either 'asc' or 'desc'

      const x = a[field].toLowerCase();
      const y = b[field].toLowerCase();

      // Determine the sort order based on the sortOrder parameter
      return order === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
    });

    // If page_number is 0, default it to 1 and set page_size to 0 to display all users
    const pageNumber = page_number === 0 ? 1 : page_number;
    const pageSize = page_number === 0 ? 0 : page_size;

    const count = sortedUsers.length;

    // Determine the limit per page; if pageSize is 0, display all users
    const limit = pageSize === 0 ? count : pageSize;

    // Calculate pagination
    const startIndex = (pageNumber - 1) * limit;
    const endIndex = Math.min(startIndex + limit, count);
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    const result = {
      page_number: pageNumber,
      page_size: paginatedUsers.length,
      count: count,
      total_pages: totalPages,
      has_previous_page: pageNumber > 1,
      has_next_page: pageNumber < totalPages,
      data: paginatedUsers,
    };

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
