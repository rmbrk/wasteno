const errors = [
  'bad_json',

  'auth_expired',

  'name_missing',
  'name_length_short',
  'name_length_long',
  'name_out_of_charset',

  'username_missing',
  'username_exists',
  'username_length_short',
  'username_length_long',
  'username_out_of_charset',

  'password_missing',
  'password_length_short',
  'password_length_long',
  'password_out_of_charset',

  'email_missing',
  'email_invalid',
  'email_length_long',

  'phone_missing',
  'phone_invalid',

  'object_missing',
  'object_not_array',
  'object_username_missing',
  'object_username_length_short',
  'object_username_length_long',
  'object_username_out_of_charset',

  'login_no',
  'login_yes',
  'login_invalid',
  'login_before_ban_end',
  'login_unexpected',
  'not_verified',

  'lon_invalid',
  'lat_invalid',

  'address_missing',
  'address_invalid',
  'address_out_of_charset',
  'address_length_short',
  'address_length_long',

  'location_multiple_main',
  'location_name_exists',

  'eid_missing',
  'eid_length_short',
  'eid_length_long',
  'eid_out_of_charset',
  'eid_portion_missing',
  'eid_portion_length_short',
  'eid_portion_length_long',
  'eid_portion_out_of_charset',

  'offset_invalid',
  'amount_invalid',
  'amount_size_big',
  'amount_size_zero',

  'sale_description_missing',
  'sale_description_length_short',
  'sale_description_length_long',
  'sale_description_out_of_charset',

  'receiver_not_exists',
  'receiver_too_many_orders',

  'provider_not_exists',
  'provider_eid_not_matching',

  'order_eid_not_exists',
  'order_eid_not_matching_receiver',

  'location_eid_not_exists',

  'sale_eid_exists',
  'sale_eid_not_exists',
  'sale_eid_missing',
  'sale_instance_quantity_invalid',
  'sale_instance_expiry_missing',
  'sale_instance_expiry_passed',
  'sale_instance_expiry_invalid',
  'sale_instance_eid_exists',
  'sale_instance_eid_not_exists',
  'sale_instance_eid_missing',
  'sale_instance_parent_eid_not_exists',
  'sale_instance_location_name_missing',
  'sale_instance_location_name_invalid',
  'sale_instance_location_name_length_short',
  'sale_instance_location_name_length_long',
  'sale_instance_location_name_out_of_charset',
  'sale_instance_location_name_not_exists',
  'sale_search_term_missing',
  'sale_search_term_length_long',
  'sale_search_term_length_short',
  'sale_search_term_out_of_charset',

  'unexpected',
];

module.exports = errors;
