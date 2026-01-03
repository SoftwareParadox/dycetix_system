# # auth_forms.py
# # Empty file - content will be added later
# from django import forms
# from django.contrib.auth.forms import AuthenticationForm
# from django.utils.translation import gettext_lazy as _

# class AdminAuthenticationForm(AuthenticationForm):
#     """Custom form that uses email instead of username"""
#     username = forms.EmailField(
#         label=_("Email"),
#         widget=forms.EmailInput(attrs={
#             'autofocus': True,
#             'placeholder': 'Enter your email address'
#         })
#     )