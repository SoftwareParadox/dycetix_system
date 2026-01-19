# user_forms.py
# Empty file - content will be added later
# admin/apps/accounts/forms/user_forms.py
from django import forms
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from ..models.admin_user import AdminUser

class AdminUserCreationForm(forms.ModelForm):
    """Form for creating new admin users."""
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput,
        help_text='At least 8 characters'
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput
    )
    
    class Meta:
        model = AdminUser
        fields = ['email', 'first_name', 'last_name', 'username', 'role']
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            # Ensure username is lowercase for consistency
            username = username.lower()
            
            # Check if username already exists
            if AdminUser.objects.filter(username__iexact=username).exists():
                raise ValidationError('This username is already taken.')
            
            # Check reserved usernames
            reserved = ['admin', 'superuser', 'system', 'root', 'administrator']
            if username in reserved:
                raise ValidationError('This username is reserved.')
        
        return username
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            email = email.lower()  # Store emails lowercase
        return email
    
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

class AdminUserChangeForm(forms.ModelForm):
    """Form for updating admin users."""
    class Meta:
        model = AdminUser
        fields = ['email', 'first_name', 'last_name', 'username', 'avatar_url', 'role', 'is_active']
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            username = username.lower()
            
            # Check if username exists (excluding current user)
            if AdminUser.objects.filter(username__iexact=username).exclude(pk=self.instance.pk).exists():
                raise ValidationError('This username is already taken.')
        
        return username
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            email = email.lower()
            if AdminUser.objects.filter(email__iexact=email).exclude(pk=self.instance.pk).exists():
                raise ValidationError('This email is already registered.')
        return email

class AdminProfileForm(forms.ModelForm):
    """Form for users to edit their own profile."""
    class Meta:
        model = AdminUser
        fields = ['username', 'first_name', 'last_name', 'avatar_url']
        widgets = {
            'username': forms.TextInput(attrs={
                'placeholder': 'Choose a display name',
                'class': 'form-control'
            }),
            'first_name': forms.TextInput(attrs={
                'placeholder': 'Your first name',
                'class': 'form-control'
            }),
            'last_name': forms.TextInput(attrs={
                'placeholder': 'Your last name',
                'class': 'form-control'
            }),
            'avatar_url': forms.URLInput(attrs={
                'placeholder': 'https://example.com/avatar.jpg',
                'class': 'form-control'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username optional but encourage it
        self.fields['username'].required = False
        self.fields['username'].help_text = 'Optional display name (3-50 characters)'
        
        # If user already has a username, show a note
        if self.instance and self.instance.username:
            self.fields['username'].help_text = 'Your current display name'
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            username = username.lower()
            
            # Check if username exists (excluding current user)
            if AdminUser.objects.filter(username__iexact=username).exclude(pk=self.instance.pk).exists():
                raise ValidationError('This username is already taken.')
            
            # Validate format
            import re
            if not re.match(r'^[a-zA-Z0-9._-]+$', username):
                raise ValidationError('Username can only contain letters, numbers, dots, underscores, and hyphens.')
            
            if len(username) < 3:
                raise ValidationError('Username must be at least 3 characters.')
        
        return username