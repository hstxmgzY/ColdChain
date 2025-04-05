package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwt_key = []byte("coldchain")

type Claims struct {
	Id   uint32
	Role uint32
	jwt.RegisteredClaims
}

func GenerateToken(user_id uint32, role uint32) (string, error) {
	claims := &Claims{
		Id:   user_id,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(2 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "coldchain",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwt_key)
}

func ParseToken(token_str string) (int, int, error) {
	token, err := jwt.ParseWithClaims(token_str, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return jwt_key, nil
	})
	if err != nil {
		return 0, 0, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return int(claims.Id), int(claims.Role), nil
	}
	return 0, 0, fmt.Errorf("token is invalid")
}
