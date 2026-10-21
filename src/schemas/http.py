from marshmallow import RAISE, Schema, ValidationError, fields, validate


class JobSchema(Schema):
	"""Validate the writable fields of a job resource."""

	class Meta:
		unknown = RAISE

	title = fields.String(required=True, validate=validate.Length(min=1, max=255))
	description = fields.String(required=True, validate=validate.Length(min=1))
	company = fields.String(required=True, validate=validate.Length(min=1, max=255))
	location = fields.String(required=True, validate=validate.Length(min=1, max=255))
	salary = fields.Float(allow_none=True, validate=validate.Range(min=0))


class JobUpdateSchema(JobSchema):
	"""Validate partial updates; route enforces that at least one field is sent."""

	title = fields.String(validate=validate.Length(min=1, max=255))
	description = fields.String(validate=validate.Length(min=1))
	company = fields.String(validate=validate.Length(min=1, max=255))
	location = fields.String(validate=validate.Length(min=1, max=255))


def validation_details(error: ValidationError) -> dict[str, list[str]]:
	return error.messages
