from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password':{'write_only':True}
        }
    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
    
class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    github_connected = serializers.SerializerMethodField()
    wakatime_connected = serializers.SerializerMethodField()

    def get_github_connected(self, obj):
        return bool(obj.github_token)

    def get_wakatime_connected(self, obj):
        return bool(obj.wakatime_token)
       