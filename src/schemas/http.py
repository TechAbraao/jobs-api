from marshmallow import RAISE, Schema, ValidationError, fields, validate


class JobSchema(Schema):
	"""Validate the writable fields of a job resource."""

	class Meta:
		unknown = RAISE

	title = fields.String(required=True, validate=validate.Length(min=1, max=255))
	description = fields.String(required=True, validate=validate.Length(min=1))
	company = fields.String(required=True, validate=validate.Length(min=1, max=255))
	location = fields.String(required=True, validate=validate.Length(min=1, max=255))
	url = fields.Url(required=True, schemes={"http", "https"}, validate=validate.Length(max=2048))
	platform = fields.String(required=True, validate=validate.Length(min=1, max=100))
	salary = fields.Float(allow_none=True, validate=validate.Range(min=0))
	modality = fields.String(allow_none=True, validate=validate.Length(max=50))
	category = fields.String(allow_none=True, validate=validate.Length(max=100))
	contract = fields.String(allow_none=True, validate=validate.Length(max=50))
	level = fields.String(allow_none=True, validate=validate.Length(max=50))
	requirements = fields.List(fields.String(validate=validate.Length(min=1)), allow_none=True)
	benefits = fields.String(allow_none=True, validate=validate.Length(max=2000))
	tempo = fields.String(allow_none=True, validate=validate.Length(max=50))


class JobUpdateSchema(JobSchema):
	"""Validate partial updates; route enforces that at least one field is sent."""

	title = fields.String(validate=validate.Length(min=1, max=255))
	description = fields.String(validate=validate.Length(min=1))
	company = fields.String(validate=validate.Length(min=1, max=255))
	location = fields.String(validate=validate.Length(min=1, max=255))
	url = fields.Url(schemes={"http", "https"}, validate=validate.Length(max=2048))
	platform = fields.String(validate=validate.Length(min=1, max=100))
	salary = fields.Float(allow_none=True, validate=validate.Range(min=0))
	modality = fields.String(allow_none=True, validate=validate.Length(max=50))
	category = fields.String(allow_none=True, validate=validate.Length(max=100))
	contract = fields.String(allow_none=True, validate=validate.Length(max=50))
	level = fields.String(allow_none=True, validate=validate.Length(max=50))
	requirements = fields.List(fields.String(validate=validate.Length(min=1)), allow_none=True)
	benefits = fields.String(allow_none=True, validate=validate.Length(max=2000))
	tempo = fields.String(allow_none=True, validate=validate.Length(max=50))


def validation_details(error: ValidationError) -> dict[str, list[str]]:
	return error.messages
